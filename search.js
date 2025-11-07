'use strict';

const searchInput = $('#search-input');
const results = $('#results');
const lyricsDiv = $('#lyrics');
const apiUrl = 'https://api.lyrics.ovh';
let timeoutSuggest;

// Hide lyrics initially
lyricsDiv.hide();

// Trigger search on input
searchInput.on('input', function () {
  if (timeoutSuggest) clearTimeout(timeoutSuggest);
  timeoutSuggest = setTimeout(fetchSuggestions, 400);
});

// Clear results
function clearResults() {
  $('.result').remove();
}

// Fetch suggestions
function fetchSuggestions() {
  const term = searchInput.val().trim();
  if (!term) {
    clearResults();
    return;
  }

  console.log('Searching for:', term);
  $.getJSON(`${apiUrl}/suggest/${term}`)
    .done((data) => {
      clearResults();

      const finalResults = [];
      const seen = new Set();

      data.data.forEach((item) => {
        if (seen.size >= 5) return;
        const title = `${item.title} - ${item.artist.name}`;
        if (!seen.has(title)) {
          seen.add(title);
          finalResults.push({
            display: title,
            artist: item.artist.name,
            title: item.title,
          });
        }
      });

      finalResults.forEach((result) => {
        const li = $('<li class="result"></li>').text(result.display);
        results.append(li);
        li.on('click', () => fetchLyrics(result));
      });
    })
    .fail(() => {
      console.error('Error fetching suggestions.');
    });
}

// Fetch lyrics
function fetchLyrics(song) {
  console.log('Fetching lyrics for:', song.artist, song.title);
  clearResults();
  lyricsDiv.slideUp();

  $.getJSON(`${apiUrl}/v1/${song.artist}/${song.title}`)
    .done((data) => {
      const lyricsText = data.lyrics
        ? data.lyrics.replace(/\n/g, '<br>')
        : 'Lyrics not found ';

      const html = `
        <h3 class="lyrics-title">${song.display}</h3>
        <div class="copy-lyrics" id="copy-lyrics" data-clipboard-target="#thelyrics">
          Copy Lyrics <span id="copy-ok"></span>
        </div>
        <div id="thelyrics">${lyricsText}</div>
      `;

      lyricsDiv.html(html).slideDown();

      const clipboard = new ClipboardJS('#copy-lyrics');
      clipboard.on('success', (e) => {
        e.clearSelection();
        $('#copy-ok').text('✓');
      });
    })
    .fail(() => {
      lyricsDiv.html('<p>Unable to load lyrics</p>').slideDown();
    });
}
