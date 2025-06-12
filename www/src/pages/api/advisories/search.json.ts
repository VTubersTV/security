import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ request }) => {
	try {
		const url = new URL(request.url);
		const query = url.searchParams.get('q')?.toLowerCase() || '';
		const severity = url.searchParams.get('severity');
		const ecosystem = url.searchParams.get('ecosystem');
		const limit = parseInt(url.searchParams.get('limit') || '10');
		const offset = parseInt(url.searchParams.get('offset') || '0');

		// Get all advisories
		const advisories = await getCollection('advisories');

		// Filter advisories based on search criteria
		let filteredAdvisories = advisories.filter(advisory => {
			const matchesQuery = query === '' || 
				advisory.data.title.toLowerCase().includes(query) ||
				advisory.data.description.toLowerCase().includes(query) ||
				advisory.data.package.name.toLowerCase().includes(query);

			const matchesSeverity = !severity || advisory.data.severity === severity;
			const matchesEcosystem = !ecosystem || advisory.data.package.ecosystem === ecosystem;

			return matchesQuery && matchesSeverity && matchesEcosystem;
		});

		// Sort by published date (newest first)
		filteredAdvisories.sort((a, b) => 
			new Date(b.data.dates.published).getTime() - new Date(a.data.dates.published).getTime()
		);

		// Apply pagination
		const paginatedAdvisories = filteredAdvisories.slice(offset, offset + limit);

		// Format the response
		const formattedAdvisories = paginatedAdvisories.map(advisory => ({
			id: advisory.slug,
			title: advisory.data.title,
			description: advisory.data.description,
			severity: advisory.data.severity,
			cvss_score: advisory.data.cvss_score,
			published: advisory.data.dates.published,
			updated: advisory.data.dates.updated,
			package: {
				name: advisory.data.package.name,
				ecosystem: advisory.data.package.ecosystem
			}
		}));

		return new Response(JSON.stringify({
			query,
			severity,
			ecosystem,
			total: filteredAdvisories.length,
			limit,
			offset,
			advisories: formattedAdvisories
		}), {
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		return new Response(JSON.stringify({
			status: 'error',
			message: 'Failed to search advisories'
		}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
}; 