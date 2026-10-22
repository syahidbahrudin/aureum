import { EditorialCalendar } from "@/components/calendar/editorial-calendar";
import { mockCalendarItems } from "@/lib/mock/calendar";

export default function CalendarPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">
          Plan deadlines and publication like a shared calendar — browse by month
          or agenda, open an item for details.
        </p>
      </div>
      <EditorialCalendar items={mockCalendarItems} />
    </div>
  );
}
