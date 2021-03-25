/**
 * #######################################
 *
 * Pivotal Tracker Planning Poker Exporter
 *
 *           by Dylan Legendre
 *     http://www.dylanlegendre.com/
 *
 * #######################################
 */
$(() => {

    console.log(`
  ____ _____     ____  ____    _____                       _            
 |  _ \\_   _|   |  _ \\|  _ \\  | ____|_  ___ __   ___  _ __| |_ ___ _ __ 
 | |_) || |_____| |_) | |_) | |  _| \\ \\/ / '_ \\ / _ \\| '__| __/ _ \\ '__|
 |  __/ | |_____|  __/|  __/  | |___ >  <| |_) | (_) | |  | ||  __/ |   
 |_|    |_|     |_|   |_|     |_____/_/\\_\\ .__/ \\___/|_|   \\__\\___|_|   
                                         |_|                            
 by Dylan Legendre
 
 http://www.dylanlegendre.com/
                                            

    `);

    loadSavedData();
    setButtonListeners();

});

/**
 * Load saved data from localStorage for use in the form.
 */
const loadSavedData = () => {
    $('#txtAPIKey').val(localStorage.getItem("apiKey"));
    $('#txtProjectID').val(localStorage.getItem("projectId"));
    $('#txtTagName').val(localStorage.getItem("tagName"));
}

// This is the global data that we will save
const global = {
    data: null
};

const loadReviewData = () => {

    let reviewHtml = `<b>Total Hits:</b> ${global.data.stories.total_hits}`;
    let csvData = '';

    reviewHtml += '<br /><br /><ul>';
    csvData += 'Issue Key,Summary,Description,Acceptance Criteria, Story Points\n';

    global.data.stories.stories.forEach((story) => {
        reviewHtml += `<li><a href="${story.url}" target="_blank">#${story.id}: ${story.name}</a></li>`;
        csvData += `${story.id},${story.name},"<a href='${story.url}' target='_blank'>#${story.id}: ${story.name}</a>",,\n`;
    });

    reviewHtml += '</ul>';

    $('#review-data').html(reviewHtml);
    $('#export-data').val(csvData);
};

/**
 * Setup various button click events and bind them.
 */
const setButtonListeners = () => {
    $('#btnGetStories').on('click', async function (e) {
        try {
            const apiKey = $('#txtAPIKey').val();
            const projectId = $('#txtProjectID').val();
            const tagName = $('#txtTagName').val();

            const url = `https://www.pivotaltracker.com/services/v5/projects/${projectId}/search?query=label%3A${tagName}&token=${apiKey}`;

            const response = await fetch(url, {
                method: 'GET',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response && response.status === 200) {
                const data = await response.json();
                global.data = data;
                $('#div-pt-data').hide();
                $('#div-review').fadeIn(1000);
                loadReviewData();
            } else {
                console.error("There was an error with the request!");
                console.error(response);
            }

            // Also save the last used query in localStorage for use next time...
            localStorage.setItem("apiKey", apiKey);
            localStorage.setItem("projectId", projectId);
            localStorage.setItem("tagName", tagName);
        } catch (err) {
            alert(err.message);
        }
    });

    $('#btnGoBack').on('click', async function (e) {
        global.data = null;
        $('#div-review').hide();
        $('#div-pt-data').fadeIn(1000);
    });

    $('#btnExport').on('click', async function (e) {
        let csvData = '';
        csvData += 'Issue Key,Summary,Description,Acceptance Criteria, Story Points\n';
        global.data.stories.stories.forEach((story) => {
            csvData += `${story.id},${story.name},"<a href="${story.url}" target="_blank">#${story.id}: ${story.name}</a>",,\n`;
        });
        $('#export-data').val(csvData);
    });
};
