# Targeting and Launch Location Selection

This document describes the logic for determining valid launch and target locations.

## Launch Location Selection
- Launch locations should be plausible based on target
- Example: Attacks on North America likely originate from:
  - Russia
  - Submarine locations (oceans)
  - Other strategic locations
- Attacks on Russia likely originate from:
  - North America
  - Submarine locations
  - Other strategic locations

## Valid Target Locations
- Any latitude/longitude coordinate is valid
- Named cities (from internal database)
- Uninhabited areas (land or ocean) via coordinates
- No restriction on targeting empty areas

## Implementation Notes
- Need to develop probability matrix for source/target relationships
- Need to identify plausible submarine launch locations
- Need to compile list of strategic launch sites 

## City Database Implementation
- Simple CSV file containing:
  - City names
  - Latitude/longitude coordinates
  - Country information
- No fuzzy matching initially
- Exact match required for city names
- Future enhancements (planned):
  - Fuzzy matching
  - Locale-dependent city names
  - Additional city metadata

## Error Handling
- Unknown city names return error
- Web UI shows error in red
- API returns HTTP 500
- Invalid targets don't count against launch limits 