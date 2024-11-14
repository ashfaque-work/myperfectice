import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AbstractDocument } from "../abstract.schema";
import { IsOptional, IsString } from "class-validator";


@Schema({ versionKey: false, timestamps: true })
export class RoleDocument extends AbstractDocument{
    @Prop()
    @IsString()
    name: string;

    @Prop()
    @IsOptional()
    @IsString()
    permissions: string[];
}

export const RoleSchema = SchemaFactory.createForClass(RoleDocument)