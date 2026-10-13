import React from 'react';
import Badge from '../ui/Badge';
import { ASSET_STATUS } from '../../utils/constants';

export const AssetStatusBadge = ({ status, size = 'md' }) => {
  switch (status) {
    case ASSET_STATUS.AVAILABLE:
      return (
        <Badge variant="gold" size={size} dot>
          Available
        </Badge>
      );
    case ASSET_STATUS.ASSIGNED:
      return (
        <Badge variant="info" size={size} dot>
          Assigned
        </Badge>
      );
    case ASSET_STATUS.MAINTENANCE:
      return (
        <Badge variant="warning" size={size} dot>
          Maintenance
        </Badge>
      );
    case ASSET_STATUS.RETURNED:
      return (
        <Badge variant="default" size={size} dot>
          Returned
        </Badge>
      );
    case ASSET_STATUS.RETIRED:
      return (
        <Badge variant="muted" size={size} dot>
          Retired
        </Badge>
      );
    case ASSET_STATUS.DISPOSED:
      return (
        <Badge variant="danger" size={size} dot>
          Disposed
        </Badge>
      );
    default:
      return (
        <Badge variant="default" size={size}>
          {status || 'Unknown'}
        </Badge>
      );
  }
};

export default AssetStatusBadge;
