const ROLES_LIST = ["Server", "Server", "Server", "Server", "Server", "Server",
  "Host", "Host", "Bartender", "Bartender",
  "Head Chef", "Sous Chef", "Line Cook", "Line Cook", "Line Cook", "Prep Cook",
  "Dishwasher", "Dishwasher",
  "Manager", "Delivery Coordinator", "Busser", "Busser"];

const FIRST_NAMES = ["Alex", "Jordan", "Sam", "Taylor", "Morgan", "Casey", "Riley", "Jamie", "Avery", "Quinn",
  "Cameron", "Drew", "Skyler", "Reese", "Finley", "Sage", "Rowan", "Dakota", "Eden", "Blake", "Kendall", "Hayden"];

const staffMembers = FIRST_NAMES.map((name, i) => ({
  id: i + 1,
  name,
  role: ROLES_LIST[i],
  type: i < 14 ? "full-time" : "part-time",
  hourlyRate: getHourlyRate(ROLES_LIST[i], i < 14),
  hireDate: getHireDate(i),
  shiftsPerWeek: i < 14 ? 5 : 3,
  avgHoursPerShift: i < 14 ? 8 : 5,
  trainingHoursMonth: 4 + Math.floor(Math.random() * 5),
}));

function getHourlyRate(role, isFullTime) {
  const base = {
    "Server": 12, "Host": 13, "Bartender": 15, "Head Chef": 28, "Sous Chef": 22,
    "Line Cook": 16, "Prep Cook": 14, "Dishwasher": 11, "Manager": 25,
    "Delivery Coordinator": 14, "Busser": 11,
  };
  return (base[role] || 12) + (isFullTime ? 2 : 0) + Math.random() * 2;
}

function getHireDate(index) {
  const monthsAgo = index < 8 ? 12 + Math.floor(Math.random() * 24) : Math.floor(Math.random() * 12);
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  return d.toISOString().split("T")[0];
}

export const generateDailyStaffSchedule = (date) => {
  const dow = new Date(date).getDay();
  const isWeekend = dow === 0 || dow === 5 || dow === 6;
  const staffOnDuty = isWeekend ? 16 : 12;
  const scheduled = [...staffMembers].sort(() => Math.random() - 0.5).slice(0, staffOnDuty);
  const noShows = Math.random() < 0.08 ? 1 : 0;
  const lateArrivals = Math.random() < 0.15 ? 1 : 0;
  return {
    date, staffOnDuty: staffOnDuty - noShows, scheduled: scheduled.length,
    noShows, lateArrivals,
    fohStaff: scheduled.filter(s => ["Server", "Host", "Bartender", "Busser", "Manager"].includes(s.role)).length,
    bohStaff: scheduled.filter(s => ["Head Chef", "Sous Chef", "Line Cook", "Prep Cook", "Dishwasher"].includes(s.role)).length,
    totalHours: scheduled.reduce((sum, s) => sum + s.avgHoursPerShift, 0) - (noShows * 6),
    labourCost: scheduled.reduce((sum, s) => sum + (s.hourlyRate * s.avgHoursPerShift), 0) - (noShows * 70),
  };
};

export const getStaffMetrics = () => {
  const totalStaff = staffMembers.length;
  const leftInYear = Math.floor(totalStaff * 0.22);
  const avgTrainingHours = staffMembers.reduce((s, m) => s + m.trainingHoursMonth, 0) / totalStaff;
  return { totalStaff, fullTime: 14, partTime: 8, turnoverRate: ((leftInYear / totalStaff) * 100).toFixed(1),
    avgTrainingHours: avgTrainingHours.toFixed(1), leftInYear };
};

export default staffMembers;
