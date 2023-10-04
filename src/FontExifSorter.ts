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

interface FontExifSorterOptions {
	inputDir: string
	outputDir: string
	useFallbackDirStructure: boolean
}

export default class FontExifSorter {
	inputDir: string | undefined
	outputDir: string | undefined
	useFallbackDirStructure?: string | boolean = false

	ignoreList: string[] = [
		'.DS_Store',
		'Thumbs.db',
		'.syncinfo',
		'.git',
		'.idea',
		'.vscode',
		'node_modules',
	]

	files: string[] = []

	constructor(public options: FontExifSorterOptions) {
		Object.assign(this, options)
	}

	init = async () => {
		clear()
		this.parseArgvs()

		await this.parseFiles()
	}

	parseArgvs = () => {
		if (!this.inputDir) {
			throw 'inputDir is required'
		}

		if (!this.outputDir) {
			throw 'outputDir is required'
		}

		if (!fs.existsSync(this.inputDir)) {
			throw `inputDir ${this.inputDir} does not exist`
		}

		if (!fs.existsSync(this.outputDir)) {
			throw `outputDir ${this.outputDir} does not exist`
		}

		this.useFallbackDirStructure =
			this.useFallbackDirStructure === true ||
			this.useFallbackDirStructure === 'true'

		this.ignoreList.push(this.outputDir)
	}

	isIgnored = (str: string) => {
		for (const i of this.ignoreList) {
			if (str.indexOf(i) !== -1) {
				return true
			}
		}

		return false
	}

	recursiveFileSearch = async (
		dir: string,
		results: string[]
	): Promise<string[]> => {
		if (!this.isIgnored(dir)) {
			const files = await fs.promises.readdir(dir)
			const filePromises = files.map(async (file) => {
				if (!this.isIgnored(file)) {
					console.log(`parsing ${dir}`)
					const filePath = `${dir}/${file}`
					const stats = await fs.promises.stat(filePath)
					if (stats.isDirectory()) {
						await this.recursiveFileSearch(filePath, results)
					} else if (stats.isFile()) {
						results.push(filePath)
					}
				}
			})

			await Promise.all(filePromises)
		}
		return results
	}

	parseFiles = async () => {
		this.files = await this.recursiveFileSearch(this.inputDir || '', [])

		const filePromises = this.files.map(async (file) => {
			const exif: CustomTags = await exiftool.read(file)

			const fileLocation =
				file.replace(`${this.inputDir}/`, '').split('/') || []

			const extension = exif['FileTypeExtension']
			const manufacturer = (
				exif['Manufacturer'] ||
				exif['Manufacturer-en-US'] ||
				(this.useFallbackDirStructure ? fileLocation[0] : '')
			).replace(/https?:\/\//g, '')
			const fontFamily =
				exif['FontFamily'] ||
				exif['FontFamily-en-US'] ||
				(this.useFallbackDirStructure ? fileLocation[1] : '')
			const fontName =
				exif['FontName'] ||
				exif['FontName-en-US'] ||
				(this.useFallbackDirStructure ? fileLocation[2] : '').replace(
					`.${extension}`,
					''
				)

			if (!manufacturer || !fontFamily || !fontName) {
				console.warn(
					`could not parse ${file}; no exif data found and useFallbackDirStructure is ${this.useFallbackDirStructure}`
				)
				return
			}

			const fileDir = `${this.outputDir}/${manufacturer}/${fontFamily}`
			const fileName = `${fileDir}/${fontName}.${extension}`

			console.log(`copying ${file} to ${fileName}`)
			await fs.promises.mkdir(fileDir, { recursive: true })
			await fs.promises.copyFile(file, fileName)
		})
		await Promise.all(filePromises)

		await exiftool.end()
	}
}
