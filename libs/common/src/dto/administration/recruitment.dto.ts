import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsOptional } from "class-validator";

export class GetRegionRequest { }

export class Region {
    _id: string;
    name: string;
}

export class GetRegionResponse {
    response: Region[];
}

export class GetTierRequest { }

class Tier {
    key: string;
    vale: number;
}

export class GetTierResponse {
    response: Tier[];
}

export class GetBehaviorRequest { }

export class GetBehaviorResponse {
    response: string[];
}

export class GetMetadataRequest { }

export class GetMetadataResponse { }

export class GetCollegesQuery {
    @ApiProperty({ required: false, description: 'Comma seperate multiple regions' })
    regions: string;
    @ApiProperty({ required: false, description: 'Comma seperate multiple tiers' })
    tiers: string;
}

export class GetCollegesRequest {
    query: GetCollegesQuery;
}

export class GetColleges {
    _id: string;
    institute: string;
}

export class GetCollegesResponse {
    response: GetColleges[];
}

class User {
    _id: string;
}

export class GetSavedSearchQuery {
    name: string;
}

export class GetSavedSearchRequest {
    query: GetSavedSearchQuery;
    user: User;
}

export class GetSavedSearch {
    _id: string;
    name: string;
}

export class GetSavedSearchResponse {
    response: GetSavedSearch[];
}

export class GetSearchDetailRequest {
    name: string;
    user: User;
}

export class GetSearchDetailResponse { }

export class ViewProfileRequest {
    id: string
    user: User;
}

export class ViewProfileResponse { }

export class GetGradeSummaryQuery {
    @ApiProperty({ required: false })
    @IsMongoId()
    @IsOptional()
    grade: string;
}

export class GetGradeSummaryRequest {
    user: string;
    query: GetGradeSummaryQuery;
}

export class GetGradeSummaryResponse { }

export class SubjectScale {
    @ApiProperty()
    subject: string;
    @ApiProperty()
    scale: string;
}

class Cores {
    @ApiProperty()
    grade: string;
    @ApiProperty()
    subject: string;
    @ApiProperty()
    scale: string;
}

export class SaveBody {
    @ApiProperty()
    name: string;
    @ApiProperty()
    regions: string[];
    @ApiProperty()
    notes: string;
    @ApiProperty()
    score10th: number;
    @ApiProperty()
    score12th: number;
    @ApiProperty()
    scoreGrad: number;
    @ApiProperty()
    cgpa10th: number;
    @ApiProperty()
    cgpa12th: number;
    @ApiProperty()
    cgpaGrad: number;
    @ApiProperty()
    tiers: number[];
    @ApiProperty()
    institutes: string[]
    @ApiProperty({ type: [SubjectScale] })
    cognitive: SubjectScale[];
    @ApiProperty({ type: [SubjectScale] })
    behavioral: SubjectScale[];
    @ApiProperty({ type: [SubjectScale] })
    programming: SubjectScale[];
    @ApiProperty({ type: [Cores] })
    cores: Cores[];
    @ApiProperty()
    certifications: string[];
}

export class SaveRequest {
    instancekey: string;
    body: SaveBody;
    user: User;
}


export class SaveResponse {

}

export class SearchBody {
    @ApiProperty()
    limit: number;
    @ApiProperty()
    page: number;
    @ApiProperty()
    institutes: string[];
    @ApiProperty()
    certifications: string[];
    @ApiProperty()
    score10th: number;
    @ApiProperty()
    cgpa10th: number;
    @ApiProperty()
    score12th: number;
    @ApiProperty()
    cgpa12th: number;
    @ApiProperty()
    scoreGrad: number;
    @ApiProperty()
    cgpaGrad: number;
    @ApiProperty({ type: [SubjectScale] })
    behavioral: SubjectScale[];
    @ApiProperty({ type: [SubjectScale] })
    cognitive: SubjectScale[];
    @ApiProperty({ type: [Cores] })
    cores: Cores[];
    @ApiProperty({ type: [SubjectScale] })
    programming: SubjectScale[];
    @ApiProperty()
    includeCount: boolean;
}

export class SearchRequest {
    body: SearchBody;
    user: User;
}

export class SearchResponse {

}

export class AddFavoriteBody {
    @ApiProperty()
    studentId: string;
    @ApiProperty()
    notes: string;
}

export class AddFavoriteRequest {
    user: User;
    body: AddFavoriteBody;
}

export class AddFavoriteResponse {
    status: string;
}

export class DeleteByIdRequest {
    id: string;
}

export class DeleteByIdResponse {
    status: string;
}

export class RemoveFavoriteRequest {
    studentId: string;
    user: User;
}

export class RemoveFavoriteResponse {
    status: string;
}


