// components/TrimModal.tsx
import React from 'react';
import VideoSlider from './VideoSlider';
import {FFmpeg} from '@ffmpeg/ffmpeg';

interface TrimModalProps {
    ffmpeg: FFmpeg;
    videoFile: File;
    onClose: () => void;
    onTrim: (start: number, end: number) => void;
}

const TrimModal: React.FC<TrimModalProps> = ({ffmpeg, videoFile, onClose, onTrim}) => {
    const handleSliderChange = (start: number, end: number) => {
        // You can add state here if you want to keep track of start and end times
        console.log(`Start: ${start}, End: ${end}`);
    };

    const handleTrim = () => {
        // You would get the start and end times from state if you added it
        onTrim(0, 16); // Example values
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-3/4 max-w-3xl">
                <h2 className="text-2xl mb-4">Trim Video</h2>
                <VideoSlider
                    ffmpeg={ffmpeg}
                    videoFile={videoFile}
                    onSliderChange={handleSliderChange}
                />
                <div className="mt-4 flex justify-end">
                    <button onClick={onClose} className="mr-2 px-4 py-2 bg-gray-200 rounded">Cancel</button>
                    <button onClick={handleTrim} className="px-4 py-2 bg-blue-500 text-white rounded">Trim</button>
                </div>
            </div>
        </div>
    );
};

export default TrimModal;
