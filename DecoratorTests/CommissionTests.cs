using Xunit;
using DecoratorGame;
using System.Collections.Generic;

namespace DecoratorTests
{
    public class CommissionTests
    {
        [Fact]
        public void TestCommissionCompletion_Success()
        {
            var room = new Room { Name = "Test Room" };
            room.Items.Add(new FurnitureItem("Old Chair", FurnitureCategory.Chair));
            
            var commission = new Commission
            {
                RequiredAdd = new List<string> { "Plant" },
                RequiredRemove = new List<string> { "Old Chair" }
            };

            room.Items.RemoveAll(i => i.Name == "Old Chair");
            room.Items.Add(new FurnitureItem("Beautiful Plant", FurnitureCategory.Plant));

            Assert.True(commission.IsCompleted(room));
        }

        [Fact]
        public void TestCommissionCompletion_Failure_MissingAdd()
        {
            var room = new Room { Name = "Test Room" };
            room.Items.Add(new FurnitureItem("Old Chair", FurnitureCategory.Chair));
            
            var commission = new Commission
            {
                RequiredAdd = new List<string> { "Plant" },
                RequiredRemove = new List<string> { "Old Chair" }
            };

            room.Items.RemoveAll(i => i.Name == "Old Chair");

            Assert.False(commission.IsCompleted(room));
        }
    }
}
