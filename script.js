// Charger les données depuis l'URL
fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
    .then(response => response.json())
    .then(data => {
        const dataset = data.monthlyVariance;
        const baseTemperature = data.baseTemperature;
        const years = [...new Set(dataset.map(d => d.year))];
        const months = [...new Set(dataset.map(d => d.month))];
        
        // Configuration des dimensions
        const margin = {top: 50, right: 50, bottom: 100, left: 60};
        const width = 960 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        // Créer l'échelle des couleurs
        const colorScale = d3.scaleSequential(d3.interpolateCool)
            .domain([baseTemperature - 5, baseTemperature + 5]);

        // Créer l'échelle X pour les années
        const xScale = d3.scaleBand()
            .domain(years)
            .range([0, width])
            .padding(0.05);

        // Créer l'échelle Y pour les mois
        const yScale = d3.scaleBand()
            .domain(months)
            .range([0, height])
            .padding(0.05);

        // Créer le SVG
        const svg = d3.select('#heatmap')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Ajouter les axes X et Y
        svg.append('g')
            .selectAll('.x-axis')
            .data(years)
            .enter()
            .append('text')
            .attr('class', 'x-axis')
            .attr('x', d => xScale(d) + xScale.bandwidth() / 2)
            .attr('y', height + margin.bottom - 10)
            .attr('text-anchor', 'middle')
            .text(d => d);

        svg.append('g')
            .selectAll('.y-axis')
            .data(months)
            .enter()
            .append('text')
            .attr('class', 'y-axis')
            .attr('x', -margin.left + 10)
            .attr('y', d => yScale(d) + yScale.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .text(d => {
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                return monthNames[d - 1];
            });

        // Ajouter les cellules de la carte thermique
        svg.selectAll('.cell')
            .data(dataset)
            .enter()
            .append('rect')
            .attr('class', 'cell')
            .attr('x', d => xScale(d.year))
            .attr('y', d => yScale(d.month))
            .attr('width', xScale.bandwidth())
            .attr('height', yScale.bandwidth())
            .attr('fill', d => colorScale(baseTemperature + d.variance))
            .attr('data-month', d => d.month)
            .attr('data-year', d => d.year)
            .attr('data-temp', d => baseTemperature + d.variance)
            .on('mouseover', (event, d) => {
                const tooltip = d3.select('#tooltip')
                    .style('visibility', 'visible')
                    .attr('data-year', d.year)
                    .html(`${d.year} - ${d.month}: ${baseTemperature + d.variance}°C`);

                const [x, y] = d3.pointer(event);
                tooltip.style('top', `${y + 5}px`).style('left', `${x + 5}px`);
            })
            .on('mouseout', () => {
                d3.select('#tooltip').style('visibility', 'hidden');
            });

        // Ajouter la légende
        const legend = d3.select('#legend');
        const colorLegend = d3.scaleLinear()
            .domain([baseTemperature - 5, baseTemperature + 5])
            .range([0, 400]);

        const legendSvg = legend.append('svg')
            .attr('width', 420)
            .attr('height', 20);

        const legendScale = legendSvg.append('g')
            .selectAll('rect')
            .data(d3.range(0, 400, 20))
            .enter()
            .append('rect')
            .attr('x', d => d)
            .attr('y', 0)
            .attr('width', 20)
            .attr('height', 20)
            .attr('fill', d => colorScale(baseTemperature + (d / 20) - 5));

        legendSvg.append('text')
            .attr('x', 0)
            .attr('y', 30)
            .text(`${baseTemperature - 5}°C`);

        legendSvg.append('text')
            .attr('x', 400)
            .attr('y', 30)
            .attr('text-anchor', 'end')
            .text(`${baseTemperature + 5}°C`);
    });
