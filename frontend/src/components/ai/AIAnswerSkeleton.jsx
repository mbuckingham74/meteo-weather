import Skeleton from '../common/Skeleton';
import ChartSkeleton from '../common/ChartSkeleton';

function AIAnswerSkeleton() {
  return (
    <div className="ai-answer-skeleton">
      <div className="ai-answer-skeleton__header">
        <Skeleton width="200px" height="28px" />
        <Skeleton width="140px" height="32px" />
      </div>
      <div className="ai-answer-skeleton__body">
        <Skeleton width="100%" height="16px" />
        <Skeleton width="95%" height="16px" />
        <Skeleton width="80%" height="16px" />
      </div>
      <div className="ai-answer-skeleton__meta">
        <Skeleton width="120px" height="20px" />
        <Skeleton width="100px" height="20px" />
      </div>
      <ChartSkeleton height="300px" />
    </div>
  );
}

export default AIAnswerSkeleton;
