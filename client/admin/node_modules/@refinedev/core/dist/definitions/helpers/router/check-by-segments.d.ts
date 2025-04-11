/**
 * This function if the route and resourceRoute match by segments.
 * - First, trailing and leading slashes are removed
 * - Then, the route and resourceRoute are split to segments and checked if they have the same number of segments
 * - Then, each segment is checked if it is a parameter or if it matches the resourceRoute segment
 * - If all segments match, the function returns true, otherwise false
 */
export declare const checkBySegments: (route: string, resourceRoute: string) => boolean;
//# sourceMappingURL=check-by-segments.d.ts.map