export class FindAllStatesReq {
    countryCode: string;
}

export class GetStateReq {
    code: string;
}

export class GetStateRes {
    response: string[];
}

export class GetInfoRes {
    name: string;
    alt_spellings: string[];
    area: number;
    borders: string[];
    calling_codes: string[];
    capital: string;
    currencies: string[];
    demonym: string;
    flag: string;
    geoJSON: GeoJSONGeometry;
    iso: ISO;
    languages: string[];
    latlng: number[];
    native_name: string;
    population: number;
    provinces: string[];
    region: string;
    subregion: string;
    timezones: string[];
    tld: string[];
    translations: Translations;
    wiki: string;
}

export class Properties {
    name: string;
}

export class Geometry {
    type: string;
    coordinates: number[][][];
}

export class GeoJSONGeometry {
    type: string;
    features: Feature[];
}

export class Feature {
    type: string;
    id: string;
    properties: Properties;
    geometry: Geometry;
}

export class ISO {
    two_letter: string;
    three_letter: string;
    alpha2: string;
    alpha3: string;
}

export class Translations {
    de: string;
    es: string;
    fr: string;
    ja: string;
    it: string;
}

export class GetInfoReq {
    code: string;
    iso: string;
}

class Country {
    code: string;
    iso: string;
}

export class FindSupportRes {
    response: Country[];
}