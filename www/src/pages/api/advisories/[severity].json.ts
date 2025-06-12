import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
	return [
		{ params: { severity: 'critical' } },
		{ params: { severity: 'high' } },
		{ params: { severity: 'moderate' } },
		{ params: { severity: 'low' } },
		{ params: { severity: 'all' } }
	];
}

export const GET: APIRoute = async ({ params }) => {
	try {
		const { severity } = params;
		
		// Get all advisories
		const advisories = await getCollection('advisories');
		
		// Filter by severity if not 'all'
		const filteredAdvisories = severity === 'all' 
			? advisories 
			: advisories.filter(advisory => advisory.data.severity === severity);

		// Format the response
		const formattedAdvisories = filteredAdvisories.map(advisory => ({
			id: advisory.slug,
			title: advisory.data.title,
			description: advisory.data.description,
			severity: advisory.data.severity,
			cvss_score: advisory.data.cvss_score,
			published: advisory.data.dates.published,
			updated: advisory.data.dates.updated,
			identifiers: advisory.data.identifiers,
			package: {
				name: advisory.data.package.name,
				ecosystem: advisory.data.package.ecosystem,
				vulnerable_range: advisory.data.package.vulnerable_range,
				fixed_version: advisory.data.package.fixed_version
			}
		}));

		return new Response(JSON.stringify({
			severity,
			count: formattedAdvisories.length,
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
			message: 'Failed to fetch advisories'
		}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
}; 