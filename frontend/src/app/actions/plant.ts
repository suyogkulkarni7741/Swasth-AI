'use server';

import { db } from "@/db";
import { plants, careInstructions } from "@/db/schema";
import { sql, ilike, or, eq, and } from "drizzle-orm"; // Added and import

export async function getPlants(query?: string) {
    try {
        if (query) {
            const searchPattern = `%${query}%`;
            const allPlants = await db
                .select()
                .from(plants)
                .where(
                    or(
                        ilike(plants.name, searchPattern),
                        // Search within benefits array by converting to string
                        sql`array_to_string(${plants.benefits}, ' ') ILIKE ${searchPattern}`
                    )
                );
            return allPlants;
        } else {
            // Return 10 random plants if no query
            const randomPlants = await db
                .select()
                .from(plants)
                .orderBy(sql`RANDOM()`)
                .limit(9);
            return randomPlants;
        }
    } catch (error) {
        console.error("Error fetching plants:", error);
        return [];
    }
}

export async function getCareInstruction(plantId: string, stage: string) {
    try {
        // Use db.select() instead of db.query() because db instance might not have schema config
        const instructions = await db
            .select()
            .from(careInstructions)
            .where(and(
                eq(careInstructions.plantId, plantId),
                eq(careInstructions.stage, stage)
            ))
            .limit(1);

        return instructions[0] || null;
    } catch (error) {
        console.error("Error fetching care instruction:", error);
        return null;
    }
}
