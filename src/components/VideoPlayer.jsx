"use client";
import React from "react";
import ReactPlayer from "react-player";

const VideoPlayer = ({ videosrc }) => {
	//video path

	return (
		<div className="w-full h-full rounded-lg shadow-md">
			<ReactPlayer
				width="350px"
				// height="350px"
				style={{ margin: "0 auto" }}
				url={videosrc}
				controls={true}
				// light is usefull incase of dark mode
				light={false}
				// picture in picture
				pip={true}
			/>
			<source src={videosrc} type="video/mp4" />
		</div>
	);
};

export default VideoPlayer;
