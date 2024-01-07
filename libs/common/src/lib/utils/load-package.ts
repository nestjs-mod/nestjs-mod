const MISSING_REQUIRED_DEPENDENCY = (name: string) =>
  `The "${name}" package is missing. Please, make sure to install this library ($ npm install ${name}).`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const loadedPackages: Record<string, any> = {};

export class LoadPackageError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

export function loadPackage(
  packageName: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  loaderFn?: Function
) {
  try {
    if (!loadedPackages[packageName]) {
      const result = loaderFn ? loaderFn() : require(packageName);
      loadedPackages[packageName] = result;
    }
    return loadedPackages[packageName];
  } catch (e) {
    throw new LoadPackageError(MISSING_REQUIRED_DEPENDENCY(packageName));
  }
}
