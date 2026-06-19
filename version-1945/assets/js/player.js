function setupPlayer(shell) {
  var button = shell.querySelector('[data-play-button]');
  var video = shell.querySelector('video');
  var message = shell.parentElement.querySelector('[data-player-message]');
  var source = shell.getAttribute('data-video-src');
  var hlsInstance = null;

  function setMessage(text) {
    if (message) {
      message.textContent = text;
    }
  }

  function play() {
    if (!source) {
      setMessage('当前播放源暂不可用。');
      return;
    }

    shell.classList.add('is-playing');
    video.setAttribute('controls', 'controls');
    video.setAttribute('playsinline', 'playsinline');
    video.setAttribute('webkit-playsinline', 'webkit-playsinline');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      }
    } else {
      video.src = source;
    }

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        setMessage('浏览器已阻止自动播放，请再次点击播放器中的播放按钮。');
      });
    }
  }

  if (button) {
    button.addEventListener('click', play);
  }

  shell.addEventListener('dblclick', function () {
    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  });
}

document.querySelectorAll('[data-player]').forEach(setupPlayer);
