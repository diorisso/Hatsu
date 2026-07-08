using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hatsu.Migrations
{
    /// <inheritdoc />
    public partial class AddUserBanner : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BannerKey",
                table: "Users",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BannerKey",
                table: "Users");
        }
    }
}
