import type { HydratedDocument, Types } from 'mongoose';

export type ObjectId = Types.ObjectId;

export type HydratedModelDocument<T> = HydratedDocument<T>;
