using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hatsu.Migrations
{
    /// <inheritdoc />
    public partial class AddPlatformIgdbId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IgdbId",
                table: "Platforms",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Platforms_IgdbId",
                table: "Platforms",
                column: "IgdbId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Platforms_IgdbId",
                table: "Platforms");

            migrationBuilder.DropColumn(
                name: "IgdbId",
                table: "Platforms");
        }
    }
}
