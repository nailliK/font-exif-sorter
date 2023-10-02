import clear from 'clear'
import fs from 'fs'
import { exiftool, Tags } from 'exiftool-vendored'

interface CustomTags extends Tags {
	'Copyright-en-US'?: string
	'FontFamily-en-US'?: string
	'FontSubfamily-en-US'?: string
	'FontSubfamilyID-en-US'?: string
	'FontName-en-US'?: string
	'NameTableVersion-en-US'?: string
	'PostScriptFontName-en-US'?: string
	'Manufacturer-en-US'?: string
	Manufacturer?: string
	'Designer-en-US'?: string
	'Description-en-US'?: string
	'VendorURL-en-US'?: string
	'License-en-US'?: string
	'LicenseInfoURL-en-US'?: string
	'PreferredFamily-en-US'?: string
	'PreferredSubfamily-en-US'?: string
	FontFamily?: string
}

const inputDir = process.argv[process.argv.length - 1]

const ignoreList = [
	'.DS_Store',
	'Thumbs.db',
	'.syncinfo',
	'.git',
	'.idea',
	'.vscode',
	'node_modules',
	'_CONVERTED_',
]

const isIgnored = (str: string) => {
	for (const i of ignoreList) {
		if (str.indexOf(i) !== -1) {
			return true
		}
	}

	return false
}

const recursiveFileSearch = async (
	dir: string,
	results: string[]
): Promise<string[]> => {
	if (!isIgnored(dir)) {
		const files = await fs.promises.readdir(dir)
		const filePromises = files.map(async (file) => {
			if (!isIgnored(file)) {
				const filePath = `${dir}/${file}`
				const stats = await fs.promises.stat(filePath)
				if (stats.isDirectory()) {
					await recursiveFileSearch(filePath, results)
				} else if (stats.isFile()) {
					results.push(filePath)
				}
			}
		})

		await Promise.all(filePromises)
	}
	return results
}

const init = async () => {
	clear()

	const files = await recursiveFileSearch(inputDir, [])

	const filePromises = files.map(async (file) => {
		const exif: CustomTags = await exiftool.read(file)

		const fileLocation = file.replace(`${inputDir}/`, '').split('/') || []

		const extension = exif['FileTypeExtension']
		const manufacturer = (
			exif['Manufacturer'] ||
			exif['Manufacturer-en-US'] ||
			fileLocation[0]
		).replace(/https?:\/\//g, '')
		const fontFamily =
			exif['FontFamily'] || exif['FontFamily-en-US'] || fileLocation[1]
		const fontName =
			exif['FontName'] ||
			exif['FontName-en-US'] ||
			fileLocation[2].replace(`.${extension}`, '')

		const fileDir = `${inputDir}/_CONVERTED_/${manufacturer}/${fontFamily}`
		const fileName = `${fileDir}/${fontName}.${extension}`
		fs.mkdirSync(fileDir, { recursive: true })
		fs.copyFileSync(file, fileName)

		console.log(`copied ${file} to ${fileName}`)
	})
	await Promise.all(filePromises)

	console.log('done')
	await exiftool.end()
	process.exit(0)
}
await init()
