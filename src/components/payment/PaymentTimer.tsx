
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface PaymentTimerProps {
  duration: number; // in seconds
  onTimeout: () => void;
}

const PaymentTimer = ({ duration, onTimeout }: PaymentTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeout]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isWarning = timeLeft <= 60; // Show warning when less than 1 minute

  return (
    <div className={`flex items-center gap-2 p-3 rounded-md ${
      isWarning ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
    }`}>
      <Clock className="h-4 w-4" />
      <span className="text-sm font-medium">
        Payment expires in: {formatTime(timeLeft)}
      </span>
    </div>
  );
};

export default PaymentTimer;
