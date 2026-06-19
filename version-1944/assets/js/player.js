(function () {
  function start(shell, video, button) {
    if (!shell || !video || shell.dataset.ready === '1') {
      return;
    }
    var source = shell.dataset.vurl;
    if (!source) {
      return;
    }
    shell.dataset.ready = '1';
    shell.classList.add('is-playing');
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      hls.on(window.Hls.Events.ERROR, function (_, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
    } else {
      video.src = source;
      video.play().catch(function () {});
    }
    if (button) {
      button.setAttribute('aria-hidden', 'true');
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var shell = document.getElementById('movie-player');
    var video = document.getElementById('movie-video');
    var button = shell ? shell.querySelector('.player-start') : null;
    if (!shell || !video) {
      return;
    }
    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        start(shell, video, button);
      });
    }
    shell.addEventListener('click', function (event) {
      if (event.target === video) {
        return;
      }
      start(shell, video, button);
    });
  });
})();
