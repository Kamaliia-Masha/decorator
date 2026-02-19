using System;
using System.Collections.Generic;
using System.Linq;

namespace DecoratorGame
{
    public enum FurnitureCategory
    {
        Chair, Table, Bed, Plant, Lamp, Rug, Window, WallDecor
    }

    public class FurnitureItem
    {
        public string Id { get; set; } = Guid.NewGuid().ToString().Substring(0, 4);
        public string Name { get; set; }
        public FurnitureCategory Category { get; set; }
        public (int x, int y) Position { get; set; }

        public FurnitureItem(string name, FurnitureCategory category, int x = 0, int y = 0)
        {
            Name = name;
            Category = category;
            Position = (x, y);
        }

        public override string ToString() => $"[{Id}] {Name} ({Category}) at ({Position.x}, {Position.y})";
    }

    public class Room
    {
        public string Name { get; set; }
        public List<FurnitureItem> Items { get; set; } = new List<FurnitureItem>();

        public void Display()
        {
            Console.WriteLine($"\n--- Room: {Name} ---");
            if (Items.Count == 0) Console.WriteLine("(Empty)");
            foreach (var item in Items)
            {
                Console.WriteLine(item);
            }
        }
    }

    public class Commission
    {
        public string ResidentName { get; set; }
        public string Brief { get; set; }
        public List<string> RequiredAdd { get; set; } = new List<string>();
        public List<string> RequiredRemove { get; set; } = new List<string>();
        public int Reward { get; set; } = 100;

        public bool IsCompleted(Room room)
        {
            // Прямая проверка требований по именам
            foreach (var reqAdd in RequiredAdd)
            {
                if (!room.Items.Any(i => i.Name.Contains(reqAdd, StringComparison.OrdinalIgnoreCase))) return false;
            }

            foreach (var reqRemove in RequiredRemove)
            {
                if (room.Items.Any(i => i.Name.Contains(reqRemove, StringComparison.OrdinalIgnoreCase))) return false;
            }

            return true;
        }
    }

    public class GameSession
    {
        public int Currency { get; private set; } = 0;
        public Room CurrentRoom { get; set; }
        public Commission CurrentCommission { get; set; }

        public void StartCommission(Room room, Commission commission)
        {
            CurrentRoom = room;
            CurrentCommission = commission;
            
            Console.WriteLine($"\n--- NEW COMMISSION: {commission.ResidentName} ---");
            Console.WriteLine($"Brief: {commission.Brief}");
            Console.WriteLine($"Requirements: Add '{string.Join(", ", commission.RequiredAdd)}'; Remove '{string.Join(", ", commission.RequiredRemove)}'");
        }

        public void Submit()
        {
            if (CurrentCommission.IsCompleted(CurrentRoom))
            {
                Currency += CurrentCommission.Reward;
                Console.WriteLine($"\nSUCCESS! {CurrentCommission.ResidentName}: 'It looks amazing! Thank you!'");
                Console.WriteLine($"Reward: {CurrentCommission.Reward} currency. Total: {Currency}");
            }
            else
            {
                Console.WriteLine($"\nFAILED. {CurrentCommission.ResidentName}: 'This is not what I asked for...'");
            }
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Welcome to Decorator MVP!");
            
            var session = new GameSession();
            
            // MVP Setup: One Room, One Commission
            var room = new Room { Name = "Small Studio" };
            room.Items.Add(new FurnitureItem("Old Wooden Chair", FurnitureCategory.Chair, 1, 1));
            room.Items.Add(new FurnitureItem("Dusty Table", FurnitureCategory.Table, 2, 2));
            room.Items.Add(new FurnitureItem("Single Bed", FurnitureCategory.Bed, 5, 0));
            room.Items.Add(new FurnitureItem("Sunny Window", FurnitureCategory.Window, 0, 0));
            room.Items.Add(new FurnitureItem("Cozy Rug", FurnitureCategory.Rug, 3, 1));

            var commission = new Commission
            {
                ResidentName = "Kamaliia",
                Brief = "I want a cozy plant and a modern lamp. Please remove that old chair!",
                RequiredAdd = new List<string> { "Plant", "Lamp" },
                RequiredRemove = new List<string> { "Old Wooden Chair" },
                Reward = 150
            };

            session.StartCommission(room, commission);

            bool running = true;
            while (running)
            {
                Console.WriteLine("\nCommands: [list], [add <name> <cat>], [remove <id>], [move <id> <x> <y>], [submit], [exit]");
                Console.Write("> ");
                var rawInput = Console.ReadLine();
                if (string.IsNullOrWhiteSpace(rawInput)) continue;
                var input = rawInput.Split(' ');

                switch (input[0].ToLower())
                {
                    case "list":
                        session.CurrentRoom.Display();
                        break;
                    case "add":
                        if (input.Length >= 3 && Enum.TryParse<FurnitureCategory>(input[2], true, out var cat))
                        {
                            session.CurrentRoom.Items.Add(new FurnitureItem(input[1], cat));
                            Console.WriteLine("Added.");
                        }
                        else
                        {
                            Console.WriteLine("Usage: add <name> <category>");
                            Console.WriteLine("Categories: Chair, Table, Bed, Plant, Lamp, Rug, Window, WallDecor");
                        }
                        break;
                    case "remove":
                        if (input.Length >= 2)
                        {
                            var itemToRemove = session.CurrentRoom.Items.FirstOrDefault(i => i.Id == input[1]);
                            if (itemToRemove != null)
                            {
                                session.CurrentRoom.Items.Remove(itemToRemove);
                                Console.WriteLine("Removed.");
                            }
                            else Console.WriteLine("Item not found.");
                        }
                        break;
                    case "move":
                        if (input.Length >= 4 && int.TryParse(input[2], out int nx) && int.TryParse(input[3], out int ny))
                        {
                            var itemToMove = session.CurrentRoom.Items.FirstOrDefault(i => i.Id == input[1]);
                            if (itemToMove != null)
                            {
                                itemToMove.Position = (nx, ny);
                                Console.WriteLine("Moved.");
                            }
                            else Console.WriteLine("Item not found.");
                        }
                        break;
                    case "submit":
                        session.Submit();
                        running = false;
                        break;
                    case "exit":
                        running = false;
                        break;
                }
            }
            
            Console.WriteLine("Thanks for playing!");
        }
    }
}
