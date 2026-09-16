# Assam Data Dictionary

## Schema Group A: All Dags Info (CSV)
Source Files: `All Dags Info/*.csv`
Format: Comma-separated values, UTF-8 with BOM

| Source Column | Detected Type | Meaning | Nullable | Example | Canonical BHOOMISETU Field | Transformation Rule |
|---|---|---|---|---|---|---|
| `district_code` | String (2 digits) | District identifier | No | `"03"` | `district.code` | Lookup `District` by code |
| `district_name` | String | District name | No | `"GOALPARA"` | `district.name` | Map to uppercase |
| `circle_code` | String | Revenue circle code | No | `"030101"` | - | Use to construct stable ID |
| `circle_name` | String | Revenue circle name | No | `"দুধনৈ ( DUDHNOI )"` | `Parcel.circle` | Store as text |
| `village_code` | String | Village identifier | No | `"030101010110002"` | - | Use to construct stable ID |
| `village_name` | String | Village name | No | `"বান্দৰশী ১ম খণ্ড..."` | `Parcel.village` | Store as text |
| `dag_no` | String | DAG (Parcel) number | No | `"1"` | `Parcel.dagNo` | Store as text |
| `patta_number` | String | Patta (Title) number | Yes | `"94"` | `Parcel.pattaNo` | Store as text |
| `patta_type` | String | Title type | Yes | `"ম্যাদী"` | `Parcel.rawSourceMetadata` | JSON metadata |
| `land_class` | String | Land classification | Yes | `"কৃষি -II"` | `Parcel.rawSourceMetadata` | JSON metadata |
| `dag_area_bigha` | Numeric | Area (Bigha) | No | `"1"` | `Parcel.area` | Convert to Hectares/SqM |
| `dag_area_katha` | Numeric | Area (Katha) | No | `"3"` | `Parcel.area` | Add to total area |
| `dag_area_lessa` | Numeric | Area (Lessa) | No | `"2.0000"` | `Parcel.area` | Add to total area |
| `dag_area_gonda` | Numeric | Area (Gonda) | No | `"0.0000"` | `Parcel.area` | Add to total area |
| `dag_area_kranti`| Numeric | Area (Kranti) | No | `"0"` | `Parcel.area` | Add to total area |

## Schema Group B: Parcel Geometry (JSON)
Source Files: `All percel info/*.json`
Format: Highly nested JSON Object

| Source Field | Detected Type | Meaning | Nullable | Example | Canonical BHOOMISETU Field | Transformation Rule |
|---|---|---|---|---|---|---|
| `crs` | String | Spatial Reference System | No | `"EPSG:32646 (UTM Zone 46N)"` | PostGIS SRID | Map to SRID 32646 |
| `id` | UUID | UUID of parcel record | No | `"68851763..."` | `Parcel.sourceId` | Store as external reference |
| `uniqueId` | String | ULPIN or internal unique ID | No | `"840EV5E3S39PH0"` | `Parcel.ulpin` | Map to ULPIN |
| `locationCode` | String | Village code (matches CSV) | No | `"020101010810008"` | - | Used for linkage |
| `geom` | WKT Polygon/MultiPolygon | Polygon coordinates in EPSG:32646 | No | `"MULTIPOLYGON((...))"` | `Parcel.geometry` | ST_GeomFromText with SRID 32646 |
| `area` | Numeric String | Computed Area (unknown unit) | No | `"363.5301276064033"` | `Parcel.rawSourceMetadata` | Store metadata |
| `attributes.TEXTPARCEL` | String | DAG Number | No | `"0"` | `Parcel.dagNo` | Map to DAG No |
| `attributes.DISTRICT` | String | District Name | No | `"Dhuburi"` | `district.name` | Resolve District |
| `attributes.CIRCLE` | String | Circle Name | No | `"Dhuburi Revenue Circle"`| `Parcel.circle` | Store text |
| `attributes.VILLAGE` | String | Village Name | No | `"Barbila Part 2"` | `Parcel.village` | Store text |
