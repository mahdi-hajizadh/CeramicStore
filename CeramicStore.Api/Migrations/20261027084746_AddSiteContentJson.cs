using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CeramicStore.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSiteContentJson : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ContentJson",
                table: "SiteSettings",
                type: "text",
                nullable: false,
                defaultValue: "{}");

            migrationBuilder.UpdateData(
                table: "SiteSettings",
                keyColumn: "Id",
                keyValue: 1,
                column: "ContentJson",
                value: "{}");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContentJson",
                table: "SiteSettings");
        }
    }
}
