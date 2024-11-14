import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AbstractDocument } from '../abstract.schema';

@Schema({ strict: true, minimize: false, autoIndex: false, timestamps: true })
export class GameAttempt extends AbstractDocument {
  @Prop({
    type: Object,
    _id: { type: Types.ObjectId, ref: 'User', required: true },
    name: String
  })
  player: {
    _id: Types.ObjectId;
    name: string;
  };

  @Prop({
    type: Object,
    _id: { type: Types.ObjectId, ref: 'PracticeSet', required: true },
    title: String,
    subject: {
      _id: { type: Types.ObjectId, ref: 'Subject' },
      name: { type: String }
    },
    expiresOn: { type: Date, default: null },
    players: [
      {
        _id: { type: Types.ObjectId, ref: 'User', required: true },
        name: String,
        mark: Number,
        time: Number,
        isWinner: Boolean
      }
    ],
    inTurnPlayer: {
      _id: { type: Types.ObjectId, ref: 'User', required: true },
      name: String
    }
  })
  game: {
    _id: Types.ObjectId;
    title: string;
    subject: {
      _id: Types.ObjectId;
      name: string;
    };
    expiresOn: Date;
    players: [
      {
        _id: Types.ObjectId;
        name: string;
        mark: number;
        time: number;
        isWinner: boolean;
      }
    ];
    inTurnPlayer: {
      _id: Types.ObjectId;
      name: string;
    };
  };

  @Prop({ type: Boolean, default: false })
  isAbandoned?: boolean;

  @Prop({ type: Boolean, default: true })
  isActive?: boolean;

  @Prop({ type: Boolean, default: false })
  isEvaluated?: boolean;

  @Prop({ type: Boolean, default: false })
  isInTurn: boolean;

  @Prop([
    {
      question: { type: Types.ObjectId, ref: 'Question' },
      answers: [{ type: Types.ObjectId }],
      isCorrect: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
      timeElapsed: { type: Number }
    }
  ])
  turns?: {
    question: Types.ObjectId;
    answers: Types.ObjectId[];
    isCorrect: boolean;
    createdAt: Date;
    timeElapsed: number;
  }[];

  @Prop({ type: Types.ObjectId, ref: 'Attempt' })
  attempt?: Types.ObjectId;
}

export const GameAttemptSchema = SchemaFactory.createForClass(GameAttempt);


// GameAttemptSchema.pre('save', function (next) {
//   if (!this.isNew) {
//     this.updatedAt = new Date();
//   }
//   next();
// });
