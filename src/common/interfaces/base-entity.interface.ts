/**
 * Base entity interface with common fields
 * All domain entities should extend this interface
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
