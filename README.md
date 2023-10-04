### Font Exif Sorter

Sort fonts in directories by their exif data:

`Manufacturer/Font-Family/Font-Name.ext`

My initial fonts directory was already sorted by hand in the format described above. My goal was to use the existing
exif data to ensure proper manufacture/license data if present.

## Usage

- dev: `yarn dev ${inputDir} ${outputDir} ${useDefaultDirectoryStructure}`
- build: `yarn build ${inputDir} ${outputDir}`
- execute: `node ./dist/index.js ${inputDir} ${outputDir}`

## Under the Hood

- This script uses font exif data if available. If `useDefaultDirectoryStructyre` is true, the script falls back to
	parsing the existing file path. Otherwise, it will skip the font.
- Font files are copied from `inputDir` to `outputDir`, preserving the original file and location
- Font metadata is not always consistent, even in popular foundries and families.
	Some additional manual reconciliation may be necessary
