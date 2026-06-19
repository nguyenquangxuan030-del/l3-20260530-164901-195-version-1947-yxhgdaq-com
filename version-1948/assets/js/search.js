
(function () {
    var input = document.getElementById('globalSearchInput');
    var typeFilter = document.getElementById('globalTypeFilter');
    var yearFilter = document.getElementById('globalYearFilter');
    var results = document.getElementById('searchResults');
    var note = document.getElementById('searchResultNote');
    var data = window.MOVIE_DATA || [];

    if (!input || !results) {
        return;
    }

    function getQueryFromUrl() {
        var params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function card(movie) {
        return [
            '<article class="movie-card">',
            '    <a class="poster-shell" href="' + escapeHtml(movie.url) + '">',
            '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="poster-play">播放</span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <div class="movie-meta-line">',
            '            <span>' + escapeHtml(movie.year) + '</span>',
            '            <span>' + escapeHtml(movie.region) + '</span>',
            '            <span>' + escapeHtml(movie.type) + '</span>',
            '        </div>',
            '        <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '        <p>' + escapeHtml(movie.oneLine || movie.genre) + '</p>',
            '        <div class="tag-row"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
            '    </div>',
            '</article>'
        ].join('\n');
    }

    function applySearch() {
        var keyword = normalize(input.value);
        var selectedType = normalize(typeFilter ? typeFilter.value : '');
        var selectedYear = yearFilter ? yearFilter.value : '';

        var matched = data.filter(function (movie) {
            var haystack = normalize([
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.category,
                (movie.tags || []).join(' '),
                movie.oneLine
            ].join(' '));
            var movieYear = Number(movie.year || 0);
            var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
            var typeMatch = !selectedType || normalize(movie.type).indexOf(selectedType) !== -1;
            var yearMatch = !selectedYear || String(movieYear) === selectedYear || (selectedYear === '2021' && movieYear <= 2021);
            return keywordMatch && typeMatch && yearMatch;
        });

        matched.sort(function (a, b) {
            return Number(b.heat || 0) - Number(a.heat || 0);
        });

        var limited = matched.slice(0, 120);
        results.innerHTML = limited.map(card).join('\n');
        if (note) {
            note.textContent = '找到 ' + matched.length + ' 条结果，当前显示前 ' + limited.length + ' 条。';
        }
    }

    input.value = getQueryFromUrl();
    input.addEventListener('input', applySearch);
    if (typeFilter) {
        typeFilter.addEventListener('change', applySearch);
    }
    if (yearFilter) {
        yearFilter.addEventListener('change', applySearch);
    }
    applySearch();
})();
