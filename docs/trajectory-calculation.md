# ICBM Trajectory Calculation

This document describes the calculation of ICBM trajectories in the system.

## Overview
Each missile's trajectory is defined by:
- Launch location (lat/long)
- Launch time
- Target location (lat/long)
- Impact time

The actual path visualization between these points will be calculated at render time. The specific formula for this calculation is TBD, but may be one of:
- Parabolic arc projected onto spherical Earth
- Linear geodesic path
- Other ballistic calculations

## Flight Time
Flight time varies based on distance and other factors. The system stores actual launch and impact times rather than assuming fixed velocity or duration.

## Visualization Requirements
- Current missile position must be calculable from stored parameters
- Path should appear as smooth arc or curve
- Must work with spherical Earth projection 

## Implementation Details
- All trajectory calculations performed client-side
- Server only stores and provides:
  - Launch coordinates and time (UTC)
  - Impact coordinates and time (UTC)
- Client responsible for:
  - Calculating current missile positions
  - Converting UTC times to local timezone
  - Rendering trajectory paths
  - Updating positions periodically

## Time Handling
- All database timestamps stored in UTC
- API accepts and returns UTC timestamps
- Web client converts to local timezone for display
- Trajectory calculations use UTC internally 