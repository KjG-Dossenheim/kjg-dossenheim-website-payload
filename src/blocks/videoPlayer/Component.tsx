const VideoPlayer = () => {
  return (
    <div data-vjs-player>
      <video id="vid1" className="video-js">
        <source src="//vjs.zencdn.net/v/oceans.mp4" />
      </video>
    </div>
  )
}

export default VideoPlayer
