### Font Exif Sorter

Sort fonts in directories by their EXIF data:

`Manufacturer/Font-Family/Font-Name.ext`

My initial fonts directory was already sorted by hand in the above format. My goal was to use the existing EXIF data to ensure proper manufacture/license data if present.

## Usage

- dev: `yarn dev ${inputDir} ${outputDir} ${useDefaultDirectoryStructure}`
- build: `yarn build ${inputDir} ${outputDir}`
- execute: `node ./dist/index.js ${inputDir} ${outputDir}`

## Under the Hood

- This script uses font EXIF data if available. If `useDefaultDirectoryStructure` is true, the script parses the existing file path. Otherwise, it will skip the font.
- Font files are copied from `inputDir` to `outputDir,` preserving the original file and location
- Even in popular foundries and families, font metadata may be inconsistent or nonexistent. Some additional manual reconciliation may be necessary.
