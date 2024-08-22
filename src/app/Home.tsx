'use client'

import {loadFFMpeg} from '@/utils/loadFFmpeg'
import {convertToHHMMSS} from '@/utils/timeConverter'
import {FFmpeg} from '@ffmpeg/ffmpeg'
import {fetchFile} from '@ffmpeg/util'
import {useRef, useState} from 'react'
import TrimModal from '@/components/TrimModal'

export default function Home() {
    const [loaded, setLoaded] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [videoBlob, setVideoURL] = useState<string | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [showTrimModal, setShowTrimModal] = useState(false);
    const messageRef = useRef<HTMLParagraphElement | null>(null)
    let ffmpegRef = useRef<FFmpeg | null>(null);

    const load = async () => {
        setIsLoading(true);
        ffmpegRef.current = await loadFFMpeg()
        setIsLoading(false);
        setLoaded(true);
    }

    const trimTheFile = async (start: number, end: number) => {
        if (ffmpegRef && ffmpegRef.current && videoFile) {
            try {
                const ffmpeg = ffmpegRef.current;
                const {name, type} = videoFile;
                const videoFileType = type.split('/')[1];

                await ffmpeg.writeFile(name, await fetchFile(videoFile));

                await ffmpeg.exec([
                    '-ss', `${convertToHHMMSS(start)}`,
                    '-i', name,
                    '-to', `${convertToHHMMSS(end)}`,
                    '-c', 'copy',
                    '-avoid_negative_ts', '1',
                    `trimmed_video.${videoFileType}`
                ]);

                const data = await ffmpeg.readFile(`trimmed_video.${videoFileType}`) as any;
                const trimmedVideoBlob = new Blob([data.buffer], {type: type});
                const trimmedVideoUrl = URL.createObjectURL(trimmedVideoBlob);
                const trimmedFile = new File([data.buffer], "Trimmed_" + name, {type: type});

                setVideoURL(trimmedVideoUrl);
                setVideoFile(trimmedFile);

                console.log(trimmedFile, "trimmed File");

                // Clean up
                ffmpeg.deleteFile(name);
                ffmpeg.deleteFile(`trimmed_video.${videoFileType}`);
            } catch (error) {
                console.error("Error trimming video:", error);
            }
        } else {
            console.error("FFmpeg or video file not available");
        }
    }

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files![0];
        const videoURL = URL.createObjectURL(file)
        setVideoURL(videoURL);
        setVideoFile(file);
    }

    return loaded ? (
        <div className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
            {
                !videoBlob ? (
                    <input type="file" onChange={handleVideoUpload} />
                ) : (
                    <>
                        <video controls>
                            <source src={videoBlob} />
                        </video>
                        <br />
                        <button
                            onClick={() => setShowTrimModal(true)}
                            className="bg-green-500 hover:bg-green-700 text-white py-3 px-6 rounded"
                        >
                            Trim Video
                        </button>
                        <p ref={messageRef}></p>
                    </>
                )
            }
            {showTrimModal && videoFile && ffmpegRef.current && (
                <TrimModal
                    ffmpeg={ffmpegRef.current}
                    videoFile={videoFile}
                    onClose={() => setShowTrimModal(false)}
                    onTrim={trimTheFile}
                />
            )}        </div>
    ) : (
        <button
            className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] flex items-center bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
            onClick={load}
        >
            Load ffmpeg-core
            {isLoading && (
                <span className="animate-spin ml-3">
                    {/* ... (loading spinner SVG) ... */}
                </span>
            )}
        </button>
    )
}
