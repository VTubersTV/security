import { z, defineCollection } from "astro:content";

const advisoriesCollection = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string().min(1, "Title is required"),
		description: z.string().min(10, "Description must be at least 10 characters"),
		type: z.literal("security-advisory"),
		status: z.enum(["open", "closed", "draft", "published", "withdrawn"]),
		severity: z.enum(["critical", "high", "moderate", "low"]),
		cvss_score: z.number().nullable(),
		cvss_vector: z.string().nullable(),
		package: z.object({
			name: z.string(),
			ecosystem: z.string(),
			vulnerable_range: z.string(),
			fixed_version: z.string().nullable(),
		}),
		identifiers: z.object({
			ghsa: z.string(),
			cve: z.string().optional(),
		}).catchall(z.string()),
		cwe_ids: z.array(z.object({
			id: z.string(),
			name: z.string(),
		})).nullable(),
		dates: z.object({
			published: z.coerce.date(),
			updated: z.coerce.date(),
			withdrawn: z.coerce.date().optional(),
			fixed: z.coerce.date().optional(),
		}),
		repository: z.object({
			name: z.string(),
			url: z.string().url(),
		}),
	})
})

export const collections = {
	advisories: advisoriesCollection,
};