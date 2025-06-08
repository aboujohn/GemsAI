/**
 * Event types used for cross-module communication
 */
export enum EventTypes {
  // Story events
  STORY_CREATED = 'story.created',
  STORY_UPDATED = 'story.updated',
  STORY_DELETED = 'story.deleted',

  // Sketch events
  SKETCH_CREATED = 'sketch.created',
  SKETCH_UPDATED = 'sketch.updated',
  SKETCH_DELETED = 'sketch.deleted',

  // Product events
  PRODUCT_CREATED = 'product.created',
  PRODUCT_UPDATED = 'product.updated',
  PRODUCT_DELETED = 'product.deleted',

  // Jeweler events
  JEWELER_ASSIGNED = 'jeweler.assigned',
  JEWELER_UNASSIGNED = 'jeweler.unassigned',

  // Order events
  ORDER_CREATED = 'order.created',
  ORDER_UPDATED = 'order.updated',
  ORDER_COMPLETED = 'order.completed',
  ORDER_CANCELLED = 'order.cancelled',

  // Authentication events
  USER_REGISTERED = 'auth.user.registered',
  USER_LOGGED_IN = 'auth.user.logged_in',
  USER_LOGGED_OUT = 'auth.user.logged_out',
}
