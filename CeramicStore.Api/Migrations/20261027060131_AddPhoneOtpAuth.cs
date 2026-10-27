using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CeramicStore.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPhoneOtpAuth : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OtpChallenges",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Purpose = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CodeHash = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AttemptCount = table.Column<int>(type: "integer", nullable: false),
                    Consumed = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OtpChallenges", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OtpChallenges_Phone_Purpose_CreatedAt",
                table: "OtpChallenges",
                columns: new[] { "Phone", "Purpose", "CreatedAt" });

            // اگر جدول Users از قبل هست، ایندکس یکتای موبایل را اضافه کن.
            migrationBuilder.Sql(
                """
                DO $$
                BEGIN
                  IF EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_name = 'Users'
                  ) AND NOT EXISTS (
                    SELECT 1 FROM pg_indexes WHERE indexname = 'IX_Users_Phone'
                  ) THEN
                    CREATE UNIQUE INDEX "IX_Users_Phone"
                    ON "Users" ("Phone")
                    WHERE "Phone" IS NOT NULL;
                  END IF;
                END $$;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "OtpChallenges");

            migrationBuilder.Sql(
                """
                DROP INDEX IF EXISTS "IX_Users_Phone";
                """);
        }
    }
}
