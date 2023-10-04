import FontExifSorter from './FontExifSorter'

const fontExifSorter = new FontExifSorter({
	inputDir: process.argv[2],
	outputDir: process.argv[3],
	useFallbackDirStructure: process.argv[4] === 'true',
})

await fontExifSorter.init().then(() => {
	console.log('done')
	process.exitCode = 0
	process.kill(process.pid, 'SIGTERM')
})
