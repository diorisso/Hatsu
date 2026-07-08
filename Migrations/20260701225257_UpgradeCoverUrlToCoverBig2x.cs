using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hatsu.Migrations
{
    /// <inheritdoc />
    public partial class UpgradeCoverUrlToCoverBig2x : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                UPDATE "Games"
                SET "CoverUrl" = REPLACE(REPLACE(REPLACE("CoverUrl", 't_thumb', 't_cover_big_2x'), 't_1080p', 't_cover_big_2x'), 't_cover_big', 't_cover_big_2x')
                WHERE "CoverUrl" LIKE '%/t_thumb/%' OR "CoverUrl" LIKE '%/t_1080p/%' OR "CoverUrl" LIKE '%/t_cover_big/%';
                """);

            migrationBuilder.Sql(
                """
                UPDATE "Games"
                SET "CoverUrl" = 'https:' || "CoverUrl"
                WHERE "CoverUrl" LIKE '//%';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                UPDATE "Games"
                SET "CoverUrl" = REPLACE("CoverUrl", 't_cover_big_2x', 't_thumb')
                WHERE "CoverUrl" LIKE '%/t_cover_big_2x/%';
                """);
        }
    }
}
