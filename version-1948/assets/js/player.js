
(function () {
    function setMessage(player, text) {
        var message = player.querySelector('.player-message');
        if (message) {
            message.textContent = text;
        }
    }

    function bindPlayer(player) {
        var video = player.querySelector('video');
        var button = player.querySelector('.player-start');
        var source = player.getAttribute('data-video-url');
        var hlsInstance = null;

        if (!video || !button || !source) {
            return;
        }

        button.addEventListener('click', function () {
            setMessage(player, '正在加载播放源...');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                setMessage(player, '当前浏览器暂不支持此播放源，请换用支持 HLS 的浏览器。');
                return;
            }

            video.controls = true;
            player.classList.add('is-playing');

            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    setMessage(player, '播放已就绪，请点击视频控件继续。');
                });
            }
        });
    }

    document.querySelectorAll('.js-player').forEach(bindPlayer);
})();
