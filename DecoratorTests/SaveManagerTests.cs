using Xunit;
using DecoratorGame;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;

namespace DecoratorTests
{
    public class SaveManagerTests
    {
        [Fact]
        public void Save_WritesFileWithCorrectSchemaAndGameVersion()
        {
            var session = BuildSession();
            var path = Path.Combine(Path.GetTempPath(), "test_save_versions.json");

            try
            {
                SaveManager.SaveTo(session, path);

                Assert.True(File.Exists(path));
                var data = JsonSerializer.Deserialize<SaveData>(File.ReadAllText(path));
                Assert.NotNull(data);
                Assert.Equal(SaveManager.CURRENT_SCHEMA_VERSION, data!.SchemaVersion);
                Assert.Equal(GameVersionInfo.GAME_VERSION, data.GameVersion);
            }
            finally
            {
                File.Delete(path);
            }
        }

        [Fact]
        public void Save_And_Load_PreservesRoomAndCurrency()
        {
            var session = BuildSession();
            var path = Path.Combine(Path.GetTempPath(), "test_save_roundtrip.json");

            try
            {
                SaveManager.SaveTo(session, path);
                var data = SaveManager.LoadFrom(path);

                Assert.NotNull(data);
                Assert.Equal("Test Room", data!.RoomName);
                Assert.Equal(42, data.Currency);
                Assert.Equal(2, data.Items.Count);
                Assert.Contains(data.Items, i => i.Name == "Cozy Chair");
                Assert.Contains(data.Items, i => i.Name == "Nice Plant");
            }
            finally
            {
                File.Delete(path);
            }
        }

        [Fact]
        public void Load_ReturnsNull_WhenFileDoesNotExist()
        {
            var result = SaveManager.LoadFrom("/tmp/nonexistent_save_xyz.json");
            Assert.Null(result);
        }

        [Fact]
        public void Migrate_UpgradesSchemaVersion0_To_Current()
        {
            var old = new SaveData
            {
                SchemaVersion = 0,
                GameVersion = "0.9.0",
                Currency = 10,
                RoomName = "Old Room",
                Items = new List<FurnitureSaveData>()
            };

            var migrated = SaveManager.Migrate(old);

            Assert.Equal(SaveManager.CURRENT_SCHEMA_VERSION, migrated.SchemaVersion);
            Assert.Equal("Old Room", migrated.RoomName);
            Assert.Equal(10, migrated.Currency);
        }

        [Fact]
        public void Migrate_DoesNotChangeAlreadyCurrent()
        {
            var current = new SaveData
            {
                SchemaVersion = SaveManager.CURRENT_SCHEMA_VERSION,
                GameVersion = GameVersionInfo.GAME_VERSION,
                Currency = 99,
                RoomName = "Studio",
                Items = new List<FurnitureSaveData>()
            };

            var result = SaveManager.Migrate(current);

            Assert.Equal(current, result);
        }

        private static GameSession BuildSession()
        {
            var room = new Room { Name = "Test Room" };
            room.Items.Add(new FurnitureItem("Cozy Chair", FurnitureCategory.Chair, 1, 2));
            room.Items.Add(new FurnitureItem("Nice Plant", FurnitureCategory.Plant, 3, 4));

            var session = new GameSession();
            session.StartCommission(room, new Commission
            {
                ResidentName = "Test",
                Brief = "Test brief",
                RequiredAdd = new List<string>(),
                RequiredRemove = new List<string>(),
                Reward = 42
            });
            // Simulate earned currency
            typeof(GameSession)
                .GetProperty("Currency")!
                .SetValue(session, 42);
            return session;
        }
    }
}
