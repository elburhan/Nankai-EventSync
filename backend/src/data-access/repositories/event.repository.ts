import { EventModel, type Event, type EventDocument } from '../models/event.model';

interface EventListFilters {
  q?: string;
  category?: string;
  status?: string;
  statusIn?: string[];
  organizerId?: string;
  upcoming?: boolean;
  from?: Date;
  to?: Date;
}

export class EventRepository {
  public create(data: Partial<Event>): Promise<EventDocument> {
    return EventModel.create(data);
  }

  public findById(eventId: string): Promise<EventDocument | null> {
    return EventModel.findById(eventId)
      .populate('organizerId', 'fullName email')
      .exec();
  }

  public findMany(
    filters: EventListFilters,
    skip: number,
    limit: number,
  ): Promise<EventDocument[]> {
    return EventModel.find(this.buildListQuery(filters))
      .sort({ startAt: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('organizerId', 'fullName email')
      .exec();
  }

  public findByOrganizerId(organizerId: string): Promise<EventDocument[]> {
    return EventModel.find({ organizerId }).sort({ createdAt: -1 }).exec();
  }

  public findManyByIds(eventIds: string[]): Promise<EventDocument[]> {
    return EventModel.find({ _id: { $in: eventIds } })
      .populate('organizerId', 'fullName email')
      .exec();
  }

  public findUpcomingPublished(limit: number): Promise<EventDocument[]> {
    return EventModel.find({
      status: 'published',
      startAt: { $gte: new Date() },
    })
      .sort({ startAt: 1, createdAt: -1 })
      .limit(limit)
      .populate('organizerId', 'fullName email')
      .exec();
  }

  public count(filters: EventListFilters): Promise<number> {
    return EventModel.countDocuments(this.buildListQuery(filters)).exec();
  }

  public findCalendarEvents(filters: EventListFilters): Promise<EventDocument[]> {
    return EventModel.find(this.buildCalendarQuery(filters))
      .sort({ startAt: 1, createdAt: -1 })
      .populate('organizerId', 'fullName email')
      .exec();
  }

  public updateById(eventId: string, data: Partial<Event>): Promise<EventDocument | null> {
    return EventModel.findByIdAndUpdate(eventId, data, {
      new: true,
      runValidators: true,
    })
      .populate('organizerId', 'fullName email')
      .exec();
  }

  public deleteById(eventId: string): Promise<EventDocument | null> {
    return EventModel.findByIdAndDelete(eventId).exec();
  }

  public setAttendeeCount(eventId: string, attendeeCount: number): Promise<EventDocument | null> {
    return EventModel.findByIdAndUpdate(
      eventId,
      { attendeeCount },
      { new: true, runValidators: true },
    ).exec();
  }

  private buildListQuery(filters: EventListFilters) {
    const query: Record<string, unknown> = {};

    if (filters.q) {
      query.$text = { $search: filters.q };
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.statusIn && filters.statusIn.length > 0) {
      query.status = { $in: filters.statusIn };
    } else if (filters.status) {
      query.status = filters.status;
    }

    if (filters.organizerId) {
      query.organizerId = filters.organizerId;
    }

    if (filters.upcoming) {
      query.startAt = { $gte: new Date() };
    }

    if (filters.from || filters.to) {
      query.startAt = {
        ...(typeof query.startAt === 'object' && query.startAt !== null ? query.startAt as Record<string, unknown> : {}),
        ...(filters.from ? { $gte: filters.from } : {}),
        ...(filters.to ? { $lte: filters.to } : {}),
      };
    }

    return query;
  }

  private buildCalendarQuery(filters: EventListFilters) {
    const query = this.buildListQuery({
      q: filters.q,
      status: filters.status,
      statusIn: filters.statusIn,
      organizerId: filters.organizerId,
    });

    if (filters.from || filters.to) {
      query.$and = [
        filters.to ? { startAt: { $lte: filters.to } } : {},
        filters.from ? { endAt: { $gte: filters.from } } : {},
      ].filter((condition) => Object.keys(condition).length > 0);
    }

    delete query.startAt;

    return query;
  }
}
