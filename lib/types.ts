export type Activity = {
  id: string;
  name: string;
  emoji: string;
  createdAt: string;
};

export type Event = {
  id: string;
  activityId: string;
  timestamp: string;
};
