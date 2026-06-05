import { RsvpModel, type Rsvp, type RsvpDocument } from '../models/rsvp.model';

export class RsvpRepository {
  public create(data: Partial<Rsvp>): Promise<RsvpDocument> {
    return RsvpModel.create(data);
  }

  public findByEventAndUser(eventId: string, userId: string): Promise<RsvpDocument | null> {
    return RsvpModel.findOne({ eventId, userId }).exec();
  }

  public async createOrUpdateGoing(eventId: string, userId: string): Promise<RsvpDocument> {
    const rsvp = await RsvpModel.findOneAndUpdate(
      { eventId, userId },
      {
        eventId,
        userId,
        status: 'going',
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    ).exec();

    if (!rsvp) {
      throw new Error('Failed to create RSVP.');
    }

    return rsvp;
  }

  public deleteByEventAndUser(eventId: string, userId: string): Promise<RsvpDocument | null> {
    return RsvpModel.findOneAndDelete({ eventId, userId }).exec();
  }

  public deleteManyByEventId(eventId: string): Promise<{ deletedCount?: number }> {
    return RsvpModel.deleteMany({ eventId }).exec();
  }

  public deleteManyByUserId(userId: string): Promise<{ deletedCount?: number }> {
    return RsvpModel.deleteMany({ userId }).exec();
  }

  public countGoingByEventId(eventId: string): Promise<number> {
    return RsvpModel.countDocuments({ eventId, status: 'going' }).exec();
  }

  public async hasGoingRsvp(eventId: string, userId: string): Promise<boolean> {
    const rsvp = await RsvpModel.exists({ eventId, userId, status: 'going' });
    return Boolean(rsvp);
  }

  public findGoingByUserId(userId: string): Promise<Array<Pick<RsvpDocument, '_id' | 'eventId'>>> {
    return RsvpModel.find({ userId, status: 'going' })
      .select('_id eventId')
      .exec();
  }
}
