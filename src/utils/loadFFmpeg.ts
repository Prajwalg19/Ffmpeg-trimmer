import {FFmpeg} from "@ffmpeg/ffmpeg"
import {toBlobURL} from "@ffmpeg/util"

export const loadFFMpeg = async () => {
    const ffmpeg = new FFmpeg()
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
    ffmpeg.on('log', ({message}: {message: string}) => {
        console.log(message)
    })
    await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
    })
    return ffmpeg;
}

