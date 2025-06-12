import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';

export async function getStaticPaths() {
	const advisories = await getCollection('advisories');
	return advisories.map(advisory => ({
		params: { id: advisory.slug }
	}));
}

export const GET: APIRoute = async ({ params }) => {
	try {
		const { id } = params;

        if (!id) {
            return new Response(JSON.stringify({
                status: 'error',
                message: 'Advisory not found'
            }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
		
		// Get the specific advisory
		const advisory = await getEntry('advisories', id);
		
		if (!advisory) {
			return new Response(JSON.stringify({
				status: 'error',
				message: 'Advisory not found'
			}), {
				status: 404,
				headers: {
					'Content-Type': 'application/json'
				}
			});
		}

		// Get related advisories (same severity, excluding current)
		const relatedAdvisories = await getCollection('advisories', ({ data, slug }) => {
			return data.severity === advisory.data.severity && slug !== id;
		});

		// Format the response
		const formattedAdvisory = {
			id: advisory.slug,
			title: advisory.data.title,
			description: advisory.data.description,
			severity: advisory.data.severity,
			cvss_score: advisory.data.cvss_score,
			cvss_vector: advisory.data.cvss_vector,
			published: advisory.data.dates.published,
			updated: advisory.data.dates.updated,
			identifiers: advisory.data.identifiers,
			package: {
				name: advisory.data.package.name,
				ecosystem: advisory.data.package.ecosystem,
				vulnerable_range: advisory.data.package.vulnerable_range,
				fixed_version: advisory.data.package.fixed_version
			},
			cwe_ids: advisory.data.cwe_ids,
			related: relatedAdvisories.map(related => ({
				id: related.slug,
				title: related.data.title,
				severity: related.data.severity,
				published: related.data.dates.published
			}))
		};

		return new Response(JSON.stringify(formattedAdvisory), {
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		return new Response(JSON.stringify({
			status: 'error',
			message: 'Failed to fetch advisory'
		}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
}; 