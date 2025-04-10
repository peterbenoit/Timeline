/**
 * Unified Timeline Library
 * Handles static content, JSON, and CSV data sources
 */
document.addEventListener('DOMContentLoaded', function () {
	// Core animation functionality
	function initializeTimelineAnimation(selector = '.timeline-item') {
		const timelineItems = document.querySelectorAll(selector);

		function isElementInViewport(el) {
			const rect = el.getBoundingClientRect();
			const windowHeight = window.innerHeight || document.documentElement.clientHeight;
			const offset = 150;

			return (
				rect.top >= -offset &&
				rect.left >= 0 &&
				rect.bottom <= windowHeight + offset &&
				rect.right <= (window.innerWidth || document.documentElement.clientWidth)
			);
		}

		function checkItems() {
			timelineItems.forEach((item) => {
				if (isElementInViewport(item)) {
					item.classList.add('animate');
				}
			});
		}

		// Initial check with slight delay for DOM rendering
		setTimeout(checkItems, 100);

		// Check on scroll and resize
		window.addEventListener('scroll', checkItems);
		window.addEventListener('resize', checkItems);

		return timelineItems; // Return for potential future use
	}

	// JSON data loader function
	function loadTimelineFromJSON(jsonSrc, targetElementId) {
		const timelineElement = document.getElementById(targetElementId);
		if (!timelineElement) return;

		// Clear loading message
		timelineElement.innerHTML = '<li class="timeline-item">Loading timeline data...</li>';

		fetch(jsonSrc)
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(data => {
				// Clear loading message
				timelineElement.innerHTML = '';

				// Process each event from JSON
				data.events.forEach(event => {
					const timelineItem = document.createElement('li');
					timelineItem.className = `timeline-item ${event.position}`;

					timelineItem.innerHTML = `
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            ${event.topic ? `<span class="timeline-topic">${event.topic}</span>` : ''}
                            <h2 class="timeline-date">${event.date}</h2>
                            <div class="timeline-content-inner">
                                <p>${event.description}</p>
                            </div>
                        </div>
                    `;
					timelineElement.appendChild(timelineItem);
				});

				// Initialize animation
				initializeTimelineAnimation();
			})
			.catch(error => {
				console.error('Error loading JSON timeline data:', error);
				timelineElement.innerHTML =
					'<li class="timeline-item error">Error loading timeline data. Please try again later.</li>';
			});
	}

	// CSV data loader function
	function loadTimelineFromCSV(csvSrc, targetElementId) {
		const timelineElement = document.getElementById(targetElementId);
		if (!timelineElement) return;

		// Clear loading message
		timelineElement.innerHTML = '<li class="timeline-item">Loading timeline data...</li>';

		fetch(csvSrc)
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.text();
			})
			.then(csv => {
				const timelineData = parseCSV(csv);

				// Clear loading message
				timelineElement.innerHTML = '';

				// Process each event from CSV
				timelineData.forEach(event => {
					const timelineItem = document.createElement('li');
					timelineItem.className = `timeline-item ${event.position}`;

					timelineItem.innerHTML = `
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            ${event.topic ? `<span class="timeline-topic">${event.topic}</span>` : ''}
                            <h2 class="timeline-date">${event.date}</h2>
                            <div class="timeline-content-inner">
                                <p>${event.description}</p>
                            </div>
                        </div>
                    `;
					timelineElement.appendChild(timelineItem);
				});

				// Initialize animation
				initializeTimelineAnimation();
			})
			.catch(error => {
				console.error('Error loading CSV timeline data:', error);
				timelineElement.innerHTML =
					'<li class="timeline-item error">Error loading timeline data. Please try again later.</li>';
			});
	}

	// Helper function to parse CSV
	function parseCSV(csv) {
		const lines = csv.split('\n');
		const headers = lines[0].split(',');
		const result = [];

		for (let i = 1; i < lines.length; i++) {
			if (lines[i].trim() === '') continue;

			let obj = {};
			let currentLine = '';
			let inQuotes = false;
			let fieldIndex = 0;

			// Custom parsing to handle quoted fields with commas
			for (let j = 0; j < lines[i].length; j++) {
				const char = lines[i][j];

				if (char === '"') {
					inQuotes = !inQuotes;
					continue;
				}

				if (char === ',' && !inQuotes) {
					obj[headers[fieldIndex]] = currentLine;
					currentLine = '';
					fieldIndex++;
					continue;
				}

				currentLine += char;
			}

			// Add the last field
			if (fieldIndex < headers.length) {
				obj[headers[fieldIndex]] = currentLine;
			}

			result.push(obj);
		}

		return result;
	}

	// Detect and initialize appropriate timeline type
	function initializeTimelines() {
		// Check for JSON timeline
		const jsonTimelineElement = document.getElementById('json-timeline');
		if (jsonTimelineElement) {
			loadTimelineFromJSON('timeline-data.json', 'json-timeline');
			return;
		}

		// Check for CSV timeline
		const csvTimelineElement = document.getElementById('csv-timeline');
		if (csvTimelineElement) {
			loadTimelineFromCSV('timeline-data.csv', 'csv-timeline');
			return;
		}

		// Default: initialize static timeline
		initializeTimelineAnimation();
	}

	// Start the appropriate initialization
	initializeTimelines();
});
