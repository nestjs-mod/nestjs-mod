#!/bin/bash

# Script to sequentially publish packages from dist/libs
# Usage: ./publish-packages.sh [--dry-run] [--tag <tag>]

# Don't exit on error - we want to continue publishing all packages
# set -e is intentionally removed to allow error handling per package

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DRY_RUN=false
TAG=""
DIST_DIR="./dist/libs"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --tag)
      TAG="$2"
      shift 2
      ;;
    --help)
      echo "Usage: $0 [--dry-run] [--tag <tag>]"
      echo ""
      echo "Options:"
      echo "  --dry-run    Show what would be published without actually publishing"
      echo "  --tag <tag>  Publish with a specific tag (e.g., latest, next, beta)"
      echo "  --help       Show this help message"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Check if dist directory exists
if [ ! -d "$DIST_DIR" ]; then
  echo -e "${RED}Error: $DIST_DIR directory does not exist${NC}"
  echo "Please run 'npm run build' first to build the packages"
  exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
  echo -e "${RED}Error: npm is not installed or not in PATH${NC}"
  exit 1
fi

# Check if npm is authenticated
if ! npm whoami &>/dev/null; then
  echo -e "${YELLOW}Warning: Not logged in to npm${NC}"
  echo -e "${YELLOW}Checking for NPM_TOKEN in environment...${NC}"
  
  if [ -n "$NPM_TOKEN" ]; then
    echo -e "${GREEN}NPM_TOKEN found in environment${NC}"
    echo -e "${YELLOW}Attempting to configure npm authentication...${NC}"
    
    # Try to set up authentication from token
    echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > ~/.npmrc 2>/dev/null || true
    echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc 2>/dev/null || true
    
    # Try again
    if npm whoami &>/dev/null; then
      echo -e "${GREEN}Successfully authenticated with NPM_TOKEN${NC}"
    else
      echo -e "${YELLOW}Authentication still failed, will attempt publish anyway${NC}"
    fi
  else
    echo -e "${RED}NPM_TOKEN not found in environment${NC}"
  fi
  echo ""
fi

# Find all package directories
PACKAGES=()
for dir in "$DIST_DIR"/*/; do
  if [ -f "$dir/package.json" ]; then
    package_name=$(node -p "require('$dir/package.json').name")
    package_version=$(node -p "require('$dir/package.json').version")
    PACKAGES+=("$dir")
    echo -e "${BLUE}[${#PACKAGES[@]}]${NC} $package_name@$package_version"
  fi
done

if [ ${#PACKAGES[@]} -eq 0 ]; then
  echo -e "${YELLOW}No packages found in $DIST_DIR${NC}"
  exit 0
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Found ${#PACKAGES[@]} package(s) to publish${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Publish packages sequentially
SUCCESS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0
FAILED_PACKAGES=()
SKIPPED_PACKAGES=()
idx=0
MAX_RETRIES=3
retry_count=0

# Function to publish all packages
publish_all_packages() {
  local attempt=$1
  local idx=0
  
  if [ $attempt -gt 1 ]; then
    echo -e "${BLUE}========================================${NC}"
    echo -e "${YELLOW}Retry attempt $attempt - Starting from first package${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
  fi
  
  for dir in "${PACKAGES[@]}"; do
    package_name=$(node -p "try { require('$dir/package.json').name } catch(e) { console.error('Error reading package name'); process.exit(1) }" 2>/dev/null) || continue
    package_version=$(node -p "try { require('$dir/package.json').version } catch(e) { console.error('Error reading version'); process.exit(1) }" 2>/dev/null) || continue
    
    echo -e "${BLUE}[$((idx + 1))/${#PACKAGES[@]}]${NC} Publishing: $package_name@$package_version"
    
    # Build publish command
    PUBLISH_CMD="npm publish"
    
    if [ "$DRY_RUN" = true ]; then
      PUBLISH_CMD="$PUBLISH_CMD --dry-run"
    else
      if [ -n "$TAG" ]; then
        PUBLISH_CMD="$PUBLISH_CMD --tag $TAG"
      fi
      # Disable provenance in CI to avoid extra authentication requirements
      if [ "$CI" = true ] || [ -n "$GITHUB_ACTIONS" ]; then
        PUBLISH_CMD="$PUBLISH_CMD --provenance=false"
      fi
    fi
    
    # Execute publish and capture output
    publish_output=$(cd "$dir" && eval "$PUBLISH_CMD" 2>&1)
    publish_exit_code=$?
    
    # Check for EOTP error (requires two-factor authentication)
    if echo "$publish_output" | grep -q "This operation requires a one-time password"; then
      echo -e "  ${RED}Status: OTP REQUIRED${NC} ✗"
      echo -e "  ${YELLOW}Two-factor authentication required${NC}"
      echo -e ""
      echo -e "  ${YELLOW}Full npm output:${NC}"
      # Show complete npm output so user can see the login URL
      echo "$publish_output" | while IFS= read -r line; do
        echo "    $line"
      done
      echo -e ""
      echo -e "  ${YELLOW}↑ Please complete authentication using the link above${NC}"
      echo -e "  ${YELLOW}Waiting 30 seconds for OTP verification...${NC}"
      sleep 30
      echo -e "  ${YELLOW}Restarting from the beginning...${NC}"
      return 1  # Signal to retry from beginning
    # Check for ENEEDAUTH error (not authenticated)
    elif echo "$publish_output" | grep -q "ENEEDAUTH\|need auth"; then
      echo -e "  ${RED}Status: AUTHENTICATION FAILED${NC} ✗"
      echo -e "  ${RED}npm is not authenticated to registry${NC}"
      echo -e ""
      echo -e "  ${RED}This command requires you to be logged in to https://registry.npmjs.org/${NC}"
      echo -e "  ${RED}You need to authorize this machine using \`npm adduser\`${NC}"
      echo -e ""
      echo -e "  ${YELLOW}In CI/CD: Make sure NPM_TOKEN secret is set correctly${NC}"
      echo -e "  ${YELLOW}Locally: Run 'npm login' before publishing${NC}"
      echo -e ""
      echo -e "${RED}========================================${NC}"
      echo -e "${RED}ERROR: Cannot continue without authentication${NC}"
      echo -e "${RED}Stopping all publishing attempts${NC}"
      echo -e "${RED}========================================${NC}"
      # Don't exit immediately, mark as failed and continue to show summary
      ((FAIL_COUNT++))
      FAILED_PACKAGES+=("$package_name@$package_version (AUTH FAILED)")
      # Set a flag to stop retries
      return 2  # Special exit code for auth failure
    # Check for E403 error (version already published)
    elif echo "$publish_output" | grep -q "You cannot publish over the previously published versions"; then
      echo -e "  ${YELLOW}Status: SKIPPED${NC} (version already published)"
      ((SKIP_COUNT++))
      SKIPPED_PACKAGES+=("$package_name@$package_version")
    elif [ $publish_exit_code -eq 0 ]; then
      echo -e "  ${GREEN}Status: PUBLISHED${NC} ✓"
      ((SUCCESS_COUNT++))
    else
      echo -e "  ${RED}Status: FAILED${NC} ✗"
      echo -e "  ${RED}Error:${NC}"
      echo "$publish_output" | sed 's/^/    /'
      ((FAIL_COUNT++))
      FAILED_PACKAGES+=("$package_name@$package_version")
    fi
    
    ((idx++))
    echo ""
  done
  
  return 0  # All packages processed successfully
}

# Main publishing loop with retry logic
while [ $retry_count -lt $MAX_RETRIES ]; do
  ((retry_count++))
  
  publish_all_packages $retry_count
  publish_result=$?
  
  if [ $publish_result -eq 0 ]; then
    # All packages processed successfully
    break
  elif [ $publish_result -eq 2 ]; then
    # Authentication failure - stop immediately
    echo -e "${RED}Authentication failure detected - stopping all retries${NC}"
    break
  else
    # OTP required or error occurred, will retry
    if [ $retry_count -lt $MAX_RETRIES ]; then
      echo -e "${YELLOW}Retrying... (attempt $retry_count of $MAX_RETRIES)${NC}"
      echo ""
    else
      echo -e "${RED}========================================${NC}"
      echo -e "${RED}ERROR: Max retries ($MAX_RETRIES) reached${NC}"
      echo -e "${RED}OTP authentication was not completed successfully${NC}"
      echo -e "${RED}Please check the logs above and try again manually${NC}"
      echo -e "${RED}========================================${NC}"
      exit 1
    fi
  fi
done

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Publication Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Successfully published: $SUCCESS_COUNT${NC}"
if [ $SKIP_COUNT -gt 0 ]; then
  echo -e "${YELLOW}Skipped (already published): $SKIP_COUNT${NC}"
  echo -e "${YELLOW}Skipped packages:${NC}"
  for pkg in "${SKIPPED_PACKAGES[@]}"; do
    echo -e "${YELLOW}  - $pkg${NC}"
  done
fi
if [ $FAIL_COUNT -gt 0 ]; then
  echo -e "${RED}Failed: $FAIL_COUNT${NC}"
  echo -e "${RED}Failed packages:${NC}"
  for pkg in "${FAILED_PACKAGES[@]}"; do
    echo -e "${RED}  - $pkg${NC}"
  done
  exit 1
else
  if [ $SKIP_COUNT -gt 0 ]; then
    echo -e "${GREEN}All new packages published successfully!${NC}"
  else
    echo -e "${GREEN}All packages published successfully!${NC}"
  fi
fi
