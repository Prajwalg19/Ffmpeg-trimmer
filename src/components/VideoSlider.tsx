// components/VideoSlider.tsx
import React, {useEffect, useState} from 'react';
import ReactSlider from 'react-slider';
import {FFmpeg} from '@ffmpeg/ffmpeg';
import {fetchFile} from '@ffmpeg/util';

interface VideoSliderProps {
    ffmpeg: FFmpeg;
    videoFile: File;
    onSliderChange: (start: number, end: number) => void;
}

const VideoSlider: React.FC<VideoSliderProps> = ({ffmpeg, videoFile, onSliderChange}) => {
    const [thumbnails, setThumbnails] = useState<string[]>([]);
    const [duration, setDuration] = useState(0);
    const [sliderValues, setSliderValues] = useState([0, 0]);

    useEffect(() => {
        generateThumbnails();
    }, [videoFile]);

    const generateThumbnails = async () => {
        const generatedThumbnails = await generateThumbnailsWithFFmpeg(ffmpeg, videoFile);
        setThumbnails(generatedThumbnails);

        // Get video duration
        await ffmpeg.writeFile(videoFile.name, await fetchFile(videoFile));
        await ffmpeg.exec(['-i', videoFile.name, '-show_entries', 'format=duration', '-v', 'quiet', '-of', 'csv=p=0', 'duration.txt']);
        const durationStr = await ffmpeg.readFile('duration.txt');
        const videoDuration = parseFloat(new TextDecoder().decode(durationStr));
        setDuration(videoDuration);
        setSliderValues([0, videoDuration]);

        // Clean up
        await ffmpeg.deleteFile(videoFile.name);
        await ffmpeg.deleteFile('duration.txt');
    };

    const handleSliderChange = (values: number[]) => {
        setSliderValues(values);
        onSliderChange(values[0], values[1]);
    };

    return (
        <div className="w-full">
            {duration > 0 && (
                <div className="relative pt-6">
                    <ReactSlider
                        className="horizontal-slider"
                        thumbClassName="thumb"
                        trackClassName="track"
                        defaultValue={[0, duration]}
                        ariaLabel={['Lower thumb', 'Upper thumb']}
                        ariaValuetext={state => `Thumb value ${state.valueNow}`}
                        renderThumb={(props, state) => <div {...props}>{state.valueNow.toFixed(1)}s</div>}
                        pearling
                        minDistance={1}
                        min={0}
                        max={duration}
                        onChange={handleSliderChange}
                    />
                    <div className="flex justify-between mt-2">
                        {thumbnails.map((thumb, index) => (
                            <img
                                key={index}
                                src={thumb}
                                alt={`Thumbnail ${index}`}
                                className="w-12 h-8 object-cover"
                                style={{
                                    position: 'absolute',
                                    left: `${(index / (thumbnails.length - 1)) * 100}%`,
                                    transform: 'translateX(-50%)',
                                    bottom: '100%',
                                    zIndex: -1
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoSlider;



async function generateThumbnailsWithFFmpeg(ffmpeg: FFmpeg, videoFile: File, numThumbnails: number = 10): Promise<string[]> {
    const thumbnails: string[] = [];
    const {name, type} = videoFile;

    try {
        // Write the video file to FFmpeg's virtual file system
        await ffmpeg.writeFile(name, await fetchFile(videoFile));

        // Get video duration using FFprobe
        await ffmpeg.exec(['-i', name, '-show_entries', 'format=duration', '-v', 'quiet', '-of', 'csv=p=0', 'duration.txt']);
        const durationStr = await ffmpeg.readFile('duration.txt');
        const duration = parseFloat(new TextDecoder().decode(durationStr));

        if (isNaN(duration)) throw new Error('Could not determine video duration');

        // Generate thumbnails
        for (let i = 0; i < numThumbnails; i++) {
            const seekTime = (i * duration / numThumbnails).toFixed(2);
            const outputFileName = `thumbnail_${i}.jpg`;

            await ffmpeg.exec([
                '-ss', seekTime,
                '-i', name,
                '-vframes', '1',
                '-q:v', '2',
                '-vf', 'scale=160:90',
                outputFileName
            ]);

            const thumbnailData = await ffmpeg.readFile(outputFileName);
            const thumbnailBlob = new Blob([thumbnailData], {type: 'image/jpeg'});
            const thumbnailUrl = URL.createObjectURL(thumbnailBlob);
            thumbnails.push(thumbnailUrl);

            // Clean up the temporary thumbnail file
            await ffmpeg.deleteFile(outputFileName);
        }

        // Clean up the input video file and duration file
        await ffmpeg.deleteFile(name);
        await ffmpeg.deleteFile('duration.txt');

        return thumbnails;
    } catch (error) {
        console.error('Error generating thumbnails:', error);
        return [];
    }
}
