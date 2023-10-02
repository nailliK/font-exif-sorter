### Font Exif Sorter

Sort fonts in directories by their exif data:

`Manufacturer/Font-Family/Font-Name.ext`

## Usage

- dev: `yarn dev ${path to your fonts directory}`
- build: `yarn build ${path to your fonts directory}`
- execute: `node ./dist/index.js ${path to your fonts directory}`

## Under the Hood

- **CAUTION: My initial fonts directory is/was already sorted by hand in the format described above. This script uses font exif data if available, but falls back to parsing the existing file path if data is missing**
- Font files are copied into a `__CONVERTED__` directory at the root of the directory parameter
- Font metadata is not always consistent, even in popular foundries and families. Some additional manual reconciliation may be necessary
